const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = async (req, res, next) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId, given_name: firstName, family_name: lastName, picture: avatarURL } = payload;

    req.user = {
      email,
      googleId,
      firstName,
      lastName,
      avatarURL,
    };
    next();
  } catch (err) {
    next(err);
  }
};
