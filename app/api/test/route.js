export async function GET() { 
    await connectDB();
    return nextResponse.json({sucess: true, message: "Sucessful Connection"}); 

}