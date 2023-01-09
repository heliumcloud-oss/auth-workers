export function formatResponse(body: object, headers?: HeadersInit, statusCode: number = 200) {
    return new Response(JSON.stringify(body), {
        headers,
        status: statusCode
    })
}

export function formatError(message: string, statusCode: number = 500) {
    return new Response(JSON.stringify({
        error: true,
        message: message,
        cats: `https://http.cat/${statusCode}`
    }), {
        status: statusCode
    })
}