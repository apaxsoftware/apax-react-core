export const GREATER_THAN_299_RESPONSE = 'GENERAL/GREATER_THAN_299_RESPONSE';

// This creates a detectable action for sagas depending on this package
export const greaterThan299Response = (response) => {
  return {
    type: GREATER_THAN_299_RESPONSE,
    response,
  };
};
