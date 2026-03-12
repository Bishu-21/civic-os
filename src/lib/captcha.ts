export const generateCaptcha = (length: number = 6): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const validateCaptcha = (input: string, actual: string): boolean => {
    return input.toUpperCase() === actual.toUpperCase();
};
