/**
 * Delete the __typename property of an object that
 * may have implicitly set, though it's not specified
 * by its type
 * @param p Any object that may has property __typename
 * @returns Object without this property
 * @TODO assure that param is mutable, e.g. by using immer.js
 */
function removeTypenameFromObject<TObject>(p: TObject): TObject {
  type TObjectWithTypename = TObject & { __typename: any };
  const ref = p as TObjectWithTypename;
  if ("__typename" in ref) delete ref.__typename;
  return ref as TObject;
}

export { removeTypenameFromObject };
