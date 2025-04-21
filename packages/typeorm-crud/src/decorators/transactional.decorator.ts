import { UseInterceptors } from "@nestjs/common";
import { TransactionInterceptor } from "../interceptors";

export const Transactional = () => UseInterceptors(TransactionInterceptor);