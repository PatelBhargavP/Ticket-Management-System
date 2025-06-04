export default async function  TicketList({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
    
  const { identifier } = await params

  return <div>My project: {identifier} List</div>
}