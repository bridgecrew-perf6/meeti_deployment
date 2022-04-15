const Comentarios = require('../../models/Comentarios');
const Meeti = require('../../models/Meeti');


module.exports.agregarComentario = async (req, res, next) => {
    //obtener el comentario
    // console.log(req.body);
    const {comentario} = req.body;

    //crear comentario en la BD
    await Comentarios.create({
        mensaje : comentario,
        usuarioId : req.user.id,
        meetiId: req.params.id
    });

    //Redireccionar a la misma pagina
    res.redirect('back');
    next();

};

//elimina un comentario de la bd
exports.eliminarComentario = async(req, res, next) => {
    // res.send('Se elimino...');
    // console.log(req.body);

    //Tomar el ID del comentario
    const {comentarioId} = req.body;

    //Consultar el comentario
    const comentario = await Comentarios.findOne({where : { id : comentarioId }});
    

    //verificar si existe el comentario
    if (!comentario) {
        res.status(404).send('Acción no válida');
        return next();
    }

    //consultar el Meeti del comentario
    const meeti = await Meeti.findOne({ where : { id : comentario.meetiId } });

    //verificar que quien lo borra sea el creador
    if (comentario.usuarioId === req.user.id || meeti.usuarioId === req.user.id) {
        await Comentarios.destroy({
            where: { id: comentario.id}
        });
        res.status(200).send('Eliminado Correctamente');
        return next();
    } else {
        res.status(403).send('Acción no válida');
        return next();
    }

}