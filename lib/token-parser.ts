import { getToken, JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/app/actions/validateApiKey";

export interface ITokenParser {
    jwt?: JWT,
    errorRes?: NextResponse<{
        message: string;
    }>
}

export default async function tokenParser(req: NextRequest): Promise<ITokenParser> {
    const returnVal: ITokenParser = {
        jwt: undefined,
        errorRes: undefined
    }
    
    // Check for API key authentication first (Bearer token)
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const apiKey = authHeader.substring(7);
        const validation = await validateApiKey(apiKey);
        
        if (validation.valid && validation.userId) {
            // Create a JWT-like object for API key authentication
            // This allows API key users to access internal APIs
            returnVal.jwt = {
                userId: validation.userId,
                // Add other required fields if needed
            } as JWT;
            return returnVal;
        } else {
            returnVal.errorRes = NextResponse.json(
                { message: "Invalid API key" },
                { status: 401 }
            );
            return returnVal;
        }
    }
    
    // Fallback to NextAuth session token
    // If you don't have NEXTAUTH_SECRET set, you will have to pass your secret as `secret` to `getToken`
    const token = await getToken({ req });
    if (token) {
        // Signed in
        returnVal.jwt = token;
    } else {
        // Not Signed in
        returnVal.errorRes = NextResponse.json({ message: "Unauthorized request" }, { status: 401 });
    }
    return returnVal
}