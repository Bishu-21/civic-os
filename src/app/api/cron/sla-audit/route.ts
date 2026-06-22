import { NextResponse } from 'next/server';
import { createAppwriteClient, DATABASE_ID, GRIEVANCES_COLLECTION_ID } from '@/lib/appwrite.server';
import { Query } from 'node-appwrite';
import { env } from '@/lib/env';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization') || '';
    const expectedSecret = env.CRON_SECRET || 'civic-cron-secret';

    if (authHeader !== `Bearer ${expectedSecret}`) {
        return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    try {
        const { databases } = createAppwriteClient();
        const now = new Date();

        const response = await databases.listDocuments({
            databaseId: DATABASE_ID,
            collectionId: GRIEVANCES_COLLECTION_ID,
            queries: [
                Query.notEqual('status', 'Resolved'),
                Query.orderDesc('createdAt'),
                Query.limit(100),
            ],
        });

        const overdue = response.documents.filter((doc: any) => {
            if (!doc.slaDeadline) return false;
            return new Date(doc.slaDeadline).getTime() < now.getTime();
        });

        const escalatedIds: string[] = [];

        for (const doc of overdue) {
            try {
                await databases.updateDocument({
                    databaseId: DATABASE_ID,
                    collectionId: GRIEVANCES_COLLECTION_ID,
                    documentId: doc.$id,
                    data: {
                        status: doc.status === 'In Progress' ? 'In Progress' : 'Pending',
                        assignedDepartment: doc.assignedDepartment || doc.department || 'General',
                        slaBreachedAt: now.toISOString(),
                        escalationFlag: true,
                    },
                });

                escalatedIds.push(doc.$id);
            } catch (updateError) {
                console.error(`[SLA_AUDIT] Failed to escalate ${doc.$id}:`, updateError);
            }
        }

        return NextResponse.json({
            success: true,
            count: response.documents.length,
            auditedCount: overdue.length,
            escalatedIds,
        });
    } catch (error: any) {
        console.error('[SLA_AUDIT] Audit failed:', error);
        return NextResponse.json({ success: false, error: error.message || 'AUDIT_FAILED' }, { status: 500 });
    }
}
