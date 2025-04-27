import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { Intercepted } from "./intercepted.decorator";
import { injectTransaction } from "../helpers/transaction.helper";

export const Transactional = (options?:{isolationLevel?:IsolationLevel}) => Intercepted(injectTransaction,options);