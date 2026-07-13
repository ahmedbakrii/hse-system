export async function GET(request) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) return new Response('No URL provided', { status: 400 });
  
  try {
    const res = await fetch(url);
    const buffer = await res.arrayBuffer();
    
    return new Response(buffer, {
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
        'Access-Control-Allow-Origin': '*', // السطر السحري لحل مشكلة تحميل الصور
      },
    });
  } catch (error) {
    return new Response('Error fetching image', { status: 500 });
  }
}