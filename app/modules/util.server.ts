
export async function getNowUnixTimeGMT(){
    // 本来はDB側で生成するべきだが、Prismaではdefault(now)が使えないため、サーバー側で生成する
    return Math.floor(Date.now() / 1000);
}