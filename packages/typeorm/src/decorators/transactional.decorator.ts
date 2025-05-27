import { WrappedBy } from "@solid-nestjs/common";
import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { transactionalWrapper } from "../helpers/transaction.helper";

export const Transactional = (options?:{isolationLevel?:IsolationLevel}) => WrappedBy(transactionalWrapper,options);