const getCacheKey = (query : Record<string,string>) : string =>{
    const sortedByKey = Object.keys(query)
    .sort()  
    .reduce((acc: Record<string,string>, key) => {
        acc[key]  = query[key];  
        return acc;
    }, {});
    return JSON.stringify(sortedByKey);
}

export default getCacheKey;