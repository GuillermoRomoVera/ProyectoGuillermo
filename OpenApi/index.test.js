const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Prueba del servidor', () => {
    it('fails, as expected', function(done) { // <= Pass in done callback
        chai.request('http://localhost:8000')
        .get('/usuario?idUsuario=1')
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array').that.has.lengthOf(1);
        const usuario = res.body[0];
        expect(usuario ).to.have.property('idUsuario', 1); 
        done();
    });
});
      
it('Insertar usuario', function (done) {
  const NuevoUsuario = {
      Nombre: 'Usuario',
      Apellido: 'Apellido'
  };

  chai.request(app)
      .post('/usuario')
      .send(NuevoUsuario)
      .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message', 'Usuario insertado');
          done();
      });
});
