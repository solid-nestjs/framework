import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { Wrapped } from "./wrapped.decorator";
import { wrapWithTransaction } from "../helpers/transaction.helper";

export const Transactional = (options?:{isolationLevel?:IsolationLevel}) => Wrapped(wrapWithTransaction,options);