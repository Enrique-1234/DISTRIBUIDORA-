// demuestra: integración de pruebas automatizadas.
test('GET /api/clientes responde con JSON', async () => {
  const res = await request(app).get('/api/clientes');
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('mensaje');
});
