import { useCallback, type FC } from "react";
import { useOrdersPresentationStore } from "../../../stores";
import { isOrdersResource } from "../../../utils";
import { useOrdersResourceSelector } from "../../../selectors";

export const OrdersResourcePicker: FC = () => {
  const resource = useOrdersResourceSelector();
  const setOrdersResource = useOrdersPresentationStore((state) => state.setOrdersResource);
  const radioInputChanged = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const resource = event.target.value;
      if (!isOrdersResource(resource)) {
        return;
      }
      setOrdersResource(resource);
    },
    [setOrdersResource],
  );

  return (
    <div>
      <label>
        <input
          type="radio"
          value="local"
          checked={resource === "local"}
          onChange={radioInputChanged}
        />
        Local
      </label>
      <label>
        <input
          type="radio"
          value="remote"
          checked={resource === "remote"}
          onChange={radioInputChanged}
        />
        Remote
      </label>
    </div>
  );
};
