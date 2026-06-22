'use server';

import { createAppwriteClient, DATABASE_ID, GRIEVANCES_COLLECTION_ID } from '@/lib/appwrite.server';
import { Query } from 'node-appwrite';
import { env } from '@/lib/env';

/**
 * Audit and Escalate Grievances
 * Automatically checks for grievances that have exceeded their SLA based on priority.
 * 1. P0 (Critical): 4 hours
 * 2. P1 (High): 12 hours
 * 3. P2 (Medium): 24 hours
 * 4. P3 (Low): 48 hours
 */
export async function auditGrievancesAction() {
    try {
        console.log(`[AUDIT_SLA] Starting audit at ${new Date().toISOString()}`);
        
        // Use server client (API Key) for administrative audit
        const { tablesDB } = createAppwriteClient();
        
        // Fetch all pending/in-progress grievances
        const response = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: GRIEVANCES_COLLECTION_ID,
            queries: [
                Query.notEqual('status', 'Resolved'),
                Query.notEqual('status', 'Escalated'),
                Query.limit(500)
            ]
        });

        const pendingRows = response.rows;
        const escalated: string[] = [];
        const now = Date.now();

        for (const row of pendingRows) {
            const createdAt = new Date(row.$createdAt).getTime();
            const elapsedHours = (now - createdAt) / (1000 * 60 * 60);
            
            let deadlineHours = 48; // Default to P3
            if (row.priority === 'Critical') deadlineHours = 4;
            if (row.priority === 'High') deadlineHours = 12;
            if (row.priority === 'Medium') deadlineHours = 24;

            if (elapsedHours > deadlineHours) {
                console.warn(`[AUDIT_SLA] Escalating Grievance ${row.$id} (Elapsed: ${elapsedHours.toFixed(1)}h, SLA: ${deadlineHours}h)`);
                
                // Update row status and metadata
                await tablesDB.updateRow({
                    databaseId: DATABASE_ID,
                    tableId: GRIEVANCES_COLLECTION_ID,
                    rowId: row.$id,
                    data: {
                        status: 'Escalated',
                        assignedTo: 'CMO Escalation Cell'
                    }
                });
                
                escalated.push(row.$id);
            }
        }

        return { 
            success: true, 
            auditedCount: pendingRows.length, 
            count: escalated.length, // Alias for dashboard expectations
            escalatedIds: escalated 
        };

    } catch (error: any) {
        console.error("[AUDIT_SLA] Audit Error:", error.message);
        return { success: false, error: error.message };
    }
}
