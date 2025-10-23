// ตรวจว่า orderItemIds ถูกต้องจริงไหม
const validOrderItems = await prisma.orderItem.findMany({
    where: { orderItem_id: { in: orderItemIds.map(Number) } },
    select: { orderItem_id: true }
  });
  
  if (validOrderItems.length !== orderItemIds.length) {
    return res.status(400).json({ message: 'พบ orderItemId ไม่ถูกต้องในคำขอ' });
  }
  