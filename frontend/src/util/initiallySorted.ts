import produce, { Draft } from "immer";
import { useEffect, useMemo, useState } from "react";

/**
 * Sometimes, it is necessary to sort data only on
 * initial rendering for good UX.
 * This might be necessary when the user is able to
 * manipulate to sort criterium, but the change of
 * the criterium shall not be immediately reflected
 * in the view component (e.g. to avoid jumping lists)
 * Example: Calendar List on user profile page
 *   => disabled are at the bottom, but not immediately
 *      after disabling
 *
 * @param data
 * @param compareFunction
 */
function useInitiallySorted<DataType extends { _id: string }>(
  data: DataType[] | undefined | null,
  skip: boolean,
  compareFunction: (a: Draft<DataType>, b: Draft<DataType>) => number
) {
  const [initiallyOrdered, setInitiallyOrdered] = useState(false);
  //order of indices is stored separately
  const [indexOrder, setIndexOrder] = useState<DataType["_id"][]>([]);

  useEffect(() => {
    if (initiallyOrdered || skip || !data) return;
    const order = produce(data, (draft) => {
      return draft.sort(compareFunction);
    }).map((o) => o._id);
    setIndexOrder(order);
    setInitiallyOrdered(true);
  }, [initiallyOrdered, skip]);

  const dataSorted = useMemo(() => {
    if (!data) return [];
    const newCalendars = data.filter(
      (c) => !indexOrder.some((o) => o === c._id)
    );
    const sortedCalendars = indexOrder
      .map((orderedId) => data.find((d) => d._id == orderedId))
      .filter((c) => typeof c !== "undefined");
    return [...newCalendars, ...sortedCalendars] as DataType[];
  }, [data, indexOrder]);

  return dataSorted;
}

export { useInitiallySorted };
