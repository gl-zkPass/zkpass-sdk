const useFetch = () => {
  async function fetchData(url: string, method: string, body: any) {
    return await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  };

  return {
    fetchData
  }
};

export default useFetch;