import "dotenv/config";
import { supabase } from "./repositories/supabase.client.js";

try {
  const { data, error } = await supabase.auth.admin.createUser({
    email: "",
    password: "",
    email_confirm: true,
  });

  if (error) throw error;

  const user = data.user;

  const { data: userCreated, error: errorUserCreated } = await supabase
    .from("usuarios")
    .insert({
      auth_user_id: user.id,
      rol: "",
      nombre_completo: "",
      telefono: "",
    });

  console.log(userCreated);
} catch (error) {
  console.log(error.message);
}
