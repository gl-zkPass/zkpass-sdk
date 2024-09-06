import { screen, waitFor } from "@testing-library/react";

export const createFetchPromise = (response: any) => {
  return Promise.resolve({
    json: () => Promise.resolve(response),
  });
};

export const checkTextToBeInDocument = async (text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument();
};

export const checkTextToBeInDocumentAsync = async (text: string) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  });
};
