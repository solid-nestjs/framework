import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { WrappedBy } from "./wrapped.decorator";
import { transactionalWrapper } from "../helpers/transaction.helper";

export const Transactional = (options?:{isolationLevel?:IsolationLevel}) => WrappedBy(transactionalWrapper,options);