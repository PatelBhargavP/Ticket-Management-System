import { getToken, JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

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
    // If you don't have NEXTAUTH_SECRET set, you will have to pass your secret as `secret` to `getToken`
    const token = await getToken({ req });
    if (token) {
        // Signed in
        console.log("JSON Web Token", JSON.stringify(token, null, 2))
        returnVal.jwt = token;
    } else {
        // Not Signed in
        returnVal.errorRes = NextResponse.json({ message: "Unauthorized request" }, { status: 401 });
    }
    return returnVal
}