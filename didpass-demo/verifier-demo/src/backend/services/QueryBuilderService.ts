import { injectable } from "inversify";
import { GenerateZkpassQueryParams } from '@backend/types/VerifierParamTypes';

const operatorMapping = {
  $eq: "==",
  $lt: "<",
  $gt: ">",
  $in: "~==",
  $nin: "~!=",
  $gte: ">=",
  $lte: "<=",
  $ne: "!=",
};

@injectable()
export class QueryBuilderService {
  public async buildFullQuery(request: GenerateZkpassQueryParams): Promise<any> {
    if (!request) return Promise.reject("Query is empty");

    try {
      const { schemaType: type, criterias } = request;

      const query = {
        and: criterias.map((criteria) => {
          const {
            credField: field,
            verifyOperator: operator,
            value,
          } = criteria;
          if (!operator || !value) return;
          const mappedOperator = operatorMapping[operator];
          return {
            [mappedOperator]: [`userData.${field}`, value],
          };
        }),
      };
      query.and.unshift({
        "==": ["type", type],
      });

      return Promise.resolve(query);
    } catch (err) {
      return Promise.reject(err);
    }
  }
}
