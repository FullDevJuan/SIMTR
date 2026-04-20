import { supabase } from '../repositories/supabase.client.js';

export const register = async (req, res) => {
  const { email, password, nombre_completo, telefono, rol } = req.body;

  if (!email || !password || !nombre_completo) {
    return res.status(400).json({ error: 'Faltan campos (email, password, nombre_completo).' });
  }

  // Prevenir que alguien se asigne ADMIN desde afuera sin validación, 
  // O en nuestro caso de prueba, dejar que mande el rol que sea si está en los permitidos.
  const roleToAssign = (rol && ['ADMIN', 'OPERADOR', 'VISUALIZADOR'].includes(rol)) ? rol : 'VISUALIZADOR';

  try {
    // 1. Crear en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Insertar en nuestra tabla pública 'usuarios'
    // Como signUp en supabase no bloquea si tienes confirm email activado, 
    // revisamos que exista user list para insertar.
    if (authData.user) {
      const { data: userPublic, error: dbError } = await supabase
        .from('usuarios')
        .insert([{
          auth_user_id: authData.user.id,
          rol: roleToAssign,
          nombre_completo,
          telefono
        }])
        .select();

      if (dbError) throw dbError;
      
      return res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: userPublic[0]
      });
    }

    res.status(200).json({ message: 'Registro en proceso. Verifica tu correo si así está configurado.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y password requeridos.' });
  }

  try {
    // Iniciar sesión con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Obtener los datos extra que tenemos en tabla pública
    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol, nombre_completo, activo')
      .eq('auth_user_id', data.user.id)
      .single();

    if (userData && !userData.activo) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacta administración.' });
    }

    res.json({
      message: 'Login exitoso',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
      user: {
        email: data.user.email,
        ...userData
      }
    });

  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  // Para logout real y matar el token localmente desde backend (usando el actual JWT del header)
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      // Cerrará sesión del token vigente ante supabase
      await supabase.auth.signOut(token);
    }
    
    res.json({ message: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
