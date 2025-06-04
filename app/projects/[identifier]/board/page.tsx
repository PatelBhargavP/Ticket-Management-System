export default async function  TicketBoard({
  params,
}: {
  params: Promise<{ identifier: string }>
}) {
    
  const { identifier } = await params

  return <div>My project: {identifier} Board</div>
}