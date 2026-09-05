"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializePaymentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class InitializePaymentDto {
}
exports.InitializePaymentDto = InitializePaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-of-event' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 0, description: 'Index into event.ticket_types array' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InitializePaymentDto.prototype, "ticketTypeIndex", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.Max)(20),
    __metadata("design:type", Number)
], InitializePaymentDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'jane@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jane Smith' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+254 712 345 678' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InitializePaymentDto.prototype, "customerPhone", void 0);
//# sourceMappingURL=initialize-payment.dto.js.map