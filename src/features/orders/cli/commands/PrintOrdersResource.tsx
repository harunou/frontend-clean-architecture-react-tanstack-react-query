import { type FC, memo, useEffect } from "react";
import { useOrdersResourceSelector } from "../../selectors";
import { useConsoleRenderer } from "../hooks/useConsoleRenderer";

declare global {
  interface Window {
    printOrdersResource?: () => void;
  }
}

type PrintOrdersResourceController = () => Promise<string | Error>;

const useController = (): PrintOrdersResourceController => {
  const resource = useOrdersResourceSelector();
  return async () => {
    return `Orders resource is "${resource}"`;
  };
};

export const PrintOrdersResource: FC = memo(() => {
  const renderer = useConsoleRenderer();
  const controller = useController();
  useEffect(() => {
    window.printOrdersResource = async () => renderer(await controller());

    return () => {
      delete window.printOrdersResource;
    };
  }, [controller, renderer]);
  return null;
});
