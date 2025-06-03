import tokenParser from "@/lib/token-parser";
import {AppUser} from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {

  // Parse the user id
  const token = await tokenParser(request);
  if(token.errorRes) {
    return token.errorRes;
  }

  const users = await AppUser.find();
 
  return new Response(JSON.stringify(users), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}