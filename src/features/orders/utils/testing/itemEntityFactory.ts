import { factoryT, fields } from "factory-t";
import { randomFrom1To100 } from "../../../../utils/testing";
import type { ItemEntity, ItemEntityId } from "../../repositories";

export const itemEntityFactory = factoryT<ItemEntity>({
  id: (ctx) => `${ctx.index}` as ItemEntityId,
  productId: fields.sequence(
    randomFrom1To100.slice(randomFrom1To100.length / 2).map((v) => v.toString()),
  ),
  quantity: fields.sequence(randomFrom1To100),
});
