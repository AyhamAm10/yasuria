const onGenerateUrl = (fileName:string)=>{
    return `uploads/${fileName}`
}

export {onGenerateUrl as imageUrl}