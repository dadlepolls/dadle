import {
  ApolloCache,
  ApolloError,
  DefaultContext,
  DocumentNode,
  MutationFunctionOptions,
  OperationVariables,
  TypedDocumentNode,
  useMutation
} from "@apollo/client";
import LoadingBar from "@util/LoadingBar";
import { message } from "antd";

function useStyledMutation<
  TData = any,
  TVariables = OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<any> = ApolloCache<any>
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  {
    showLoadingBar = true,
    statusCallbackFunction = () => {},
    successMessage = "Speichern erfolgreich",
    onSuccess = () => {},
    errorMessage = "Speichern fehlgeschlagen!",
    onError = () => {},
    mutationOptions = {},
  }: {
    showLoadingBar?: boolean;
    statusCallbackFunction?: (b: boolean) => any;
    successMessage?: string | JSX.Element | undefined | null;
    onSuccess?: (d?: TData | null) => any | Promise<any>;
    errorMessage?: string | JSX.Element;
    onError?: () => any | Promise<any>;
    mutationOptions?: MutationFunctionOptions<
      TData,
      TVariables,
      TContext,
      TCache
    >;
  } = {}
) {
  const [m] = useMutation<TData, TVariables, TContext, TCache>(mutation);

  return async (
    variables: TVariables,
    options?: MutationFunctionOptions<TData, TVariables, TContext, TCache>
  ) => {
    if (showLoadingBar) LoadingBar.start();
    statusCallbackFunction(true);

    try {
      const res = await m({
        ...mutationOptions,
        ...options,
        variables,
      });
      await onSuccess(res.data);
      if (successMessage) message.success(successMessage);

      return res;
    } catch (ex) {
      let additionalMessage;
      if (ex instanceof ApolloError) {
        additionalMessage = (
          <>
            <br />
            <small>{ex.message}</small>
          </>
        );
      }
      message.error(
        <>
          <span>{errorMessage}</span>
          {additionalMessage}
        </>
      );
      await onError();
    } finally {
      statusCallbackFunction(false);
      if (showLoadingBar) LoadingBar.done();
    }
  };
}

export { useStyledMutation };

