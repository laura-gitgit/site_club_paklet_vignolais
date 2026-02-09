import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/gestion/login")) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/gestion")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/gestion/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", session.user.email)
    .maybeSingle();

  if (!adminUser) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/gestion/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/gestion/:path*"],
};
