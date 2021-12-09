import { IGraphContext } from "../util/types";
import { AuthChecker } from "type-graphql";

/**
 * full call signature for later functionality:
 * const graphAuthChecker: AuthChecker<IGraphContext> = (
 *   { root, args, context, info },
 *   roles
 * ) => {}
 */

const graphAuthChecker: AuthChecker<IGraphContext> = ({ context }, roles) => {
  return roles.length == 0 && context.user?._id ? true : false;
};

export { graphAuthChecker };
