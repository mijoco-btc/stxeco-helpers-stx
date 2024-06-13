"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalStage = void 0;
var ProposalStage;
(function (ProposalStage) {
    ProposalStage[ProposalStage["UNFUNDED"] = 0] = "UNFUNDED";
    ProposalStage[ProposalStage["PARTIAL_FUNDING"] = 1] = "PARTIAL_FUNDING";
    ProposalStage[ProposalStage["PROPOSED"] = 2] = "PROPOSED";
    ProposalStage[ProposalStage["ACTIVE"] = 3] = "ACTIVE";
    ProposalStage[ProposalStage["INACTIVE"] = 4] = "INACTIVE";
    ProposalStage[ProposalStage["CONCLUDED"] = 5] = "CONCLUDED";
})(ProposalStage || (exports.ProposalStage = ProposalStage = {}));
