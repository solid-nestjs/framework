import { SwaggerUiOptions } from "@nestjs/swagger/dist/interfaces/swagger-ui-options.interface";

export const swaggerRecomenedOptions:SwaggerUiOptions = {
    tagsSorter: "alpha",
    operationsSorter: function (a, b) {
        var order = {'get': '0', 'post': '1', 'put': '2', 'delete': '3'};
        return order[a.get("method")].localeCompare(order[b.get("method")]);
    },
}