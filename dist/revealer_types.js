"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestType = exports.CommitmentStatus = exports.RevealerTxModes = exports.RevealerTxTypes = void 0;
var RevealerTxTypes;
(function (RevealerTxTypes) {
    RevealerTxTypes["SBTC_DEPOSIT"] = "SBTC_DEPOSIT";
    RevealerTxTypes["SBTC_WITHDRAWAL"] = "SBTC_WITHDRAWAL";
})(RevealerTxTypes || (exports.RevealerTxTypes = RevealerTxTypes = {}));
var RevealerTxModes;
(function (RevealerTxModes) {
    RevealerTxModes["OP_RETURN"] = "OP_RETURN";
    RevealerTxModes["OP_DROP"] = "OP_DROP";
})(RevealerTxModes || (exports.RevealerTxModes = RevealerTxModes = {}));
var CommitmentStatus;
(function (CommitmentStatus) {
    CommitmentStatus[CommitmentStatus["UNPAID"] = 0] = "UNPAID";
    CommitmentStatus[CommitmentStatus["PENDING"] = 1] = "PENDING";
    CommitmentStatus[CommitmentStatus["PAID"] = 2] = "PAID";
    CommitmentStatus[CommitmentStatus["REVEALED"] = 3] = "REVEALED";
    CommitmentStatus[CommitmentStatus["RECLAIMED"] = 4] = "RECLAIMED";
})(CommitmentStatus || (exports.CommitmentStatus = CommitmentStatus = {}));
var RequestType;
(function (RequestType) {
    RequestType["INSCRIPTION"] = "INSCRIPTION";
    RequestType["SBTC_DEPOSIT"] = "SBTC_DEPOSIT";
    RequestType["SBTC_WITHDRAWAL"] = "SBTC_WITHDRAWAL";
})(RequestType || (exports.RequestType = RequestType = {}));
