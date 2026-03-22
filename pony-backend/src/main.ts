async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // ยอมรับการเรียกจากทุกที่ (รวมถึงมือถือคุณด้วย)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  // แก้ตรงนี้: ให้ใช้พอร์ตจาก Render ถ้าไม่มีค่อยใช้ 3000
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${port}`);
}