import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { redirect } from 'next/navigation';
import ApiKeysPageClient from '@/components/api-keys-page-client';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import Link from 'next/link';

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">

            <div className="pt-3">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/projects">Projects</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{'API Keys'}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Manage your API keys for accessing the Ticket Management System via MCP
        </p>
      </div>
      <ApiKeysPageClient />
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: 'API Keys - TicketFlow',
    description: 'Manage your API keys for MCP client access',
  };
}
