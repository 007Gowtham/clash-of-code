class ApiError extends Error{
constructor(StatusCode,message='Something went wrong',errors=[],stack=''){
    super(message);
    this.statusCode=StatusCode;
    this.message=message;
    this.errors=errors;
    if(stack){
        this.stack=stack;
    }else{
        Error.captureStackTrace(this,this.constructor);
    }
}
}

export { ApiError } ;