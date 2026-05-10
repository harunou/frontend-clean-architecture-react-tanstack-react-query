import { useCallback, type FC } from "react";
import { useOrdersPresentationStore } from "../../stores";
import { isOrdersResource } from "../../utils";
import { useOrdersResourceSelector } from "../../selectors";

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
    <div className="join">
      <input
        className="join-item btn btn-sm"
        type="radio"
        name="orders-resource"
        aria-label="Local"
        value="local"
        checked={resource === "local"}
        onChange={radioInputChanged}
      />
      <input
        className="join-item btn btn-sm"
        type="radio"
        name="orders-resource"
        aria-label="Remote"
        value="remote"
        checked={resource === "remote"}
        onChange={radioInputChanged}
      />
    </div>
  );
};
