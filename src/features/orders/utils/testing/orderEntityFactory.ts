import { factoryT, fields } from "factory-t";
import { randomFrom1To100 } from "../../../../utils/testing";
import type { OrderEntity, OrderEntityId } from "../../repositories";

export const orderEntityFactory = factoryT<OrderEntity>({
  id: (ctx) => `${ctx.index}` as OrderEntityId,
  userId: fields.sequence(randomFrom1To100.map((n) => n.toString())),
  itemEntities: [],
});
