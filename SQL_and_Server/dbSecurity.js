import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import { readFileSync } from 'fs'
import textbelt from 'textbelt'

// delete later: 
// oakeson - 11111111
// sparkling - 87654321

const saltRounds = 12;
const otpLanguage = "0123456789"
const otpLength = 4
//const privatejwtkey = readFileSync('./cred/https/SJjwtprivate.key', 'utf8')
//const publicjwtkey = readFileSync('./cred/https/SJjwtpublic.key', 'utf8')
export default class dbSecurity {
    
    /**
     * Checks user input for bad characters that may affect database
     * @param {*} input
     * @returns bool defining validity of input string
     */
    static checkInput(input) {
        // .username || input.pwd.includes(regex) || input.email.includes(regex)
        const regex = /[&<>"'/]/ig;
        return !regex.test(input)        
    }
    
    static hashPW(input) {
        try {
            var salt = bcrypt.genSaltSync(saltRounds)
            var hashed = bcrypt.hashSync(input, salt)
            return hashed
        } catch (error) {
            console.log("Invalid Password Input")
            return error
        }
    }

    static generateOTP() {
        let otp = ""
        for (let i = 0; i < otpLength; i++)
            otp = otp + otpLanguage[Math.floor(Math.random() * otpLanguage.length)]
        return otp
    }

    static generateToken(user) {
        return jwt.sign({user: user}, privatejwtkey, { algorithm: "RS256", expiresIn: "24h" })
    }

    static validatePW(user, input) {
        // req.query.password result.query.password
        var valid = bcrypt.compareSync(input, user)
        return valid
    }

    static validateToken(token) {
        try {
            return jwt.verify(token, publicjwtkey, { algorithms: ["RS256"] })
        }
        catch(err) {
            return new Error(err)
        }
    }

    static encrypt(statement) {
        // encrypt user data
    }

   
    static async sendEmail(email, code) {
        console.log("email:", email, " code:", code)
        try {
            const transport = nodemailer.createTransport({
                service: 'Gmail',   
                auth: {
                    user: 'solacejourneynoreply@gmail.com',
                    pass: "dlfj prvb qcnr vwkr"
                }
            });
            transport.sendMail({
                from: 'solacejourneynoreply@gmail.com',
                to: email,
                subject: 'Confirmation Required',
                text: 'Confirmation Code: ' + code + '\r\n'
            });
        } catch (error) {
            console.log('invalid email')
        }
    }

    static twoFactorAuth(phoneNum,code) {
        fetch('https://textbelt.com/text', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: phoneNum,
              message: 'Your Solace Journey verification code is ' + code,
              key: '44939a5f612b5c43e558b0de92e4ca7a8e49942beVbVZRPCbNg5hBr8ypKixG3IY',
            }),
          }).then(response => {
            return response.json();
          }).then(data => {
            console.log(data);
          });
    }
    
    static emailFormat(email) {
        let regex = RegExp('^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$', 'gm')
        return regex.test(email)
    }
}
dbSecurity.twoFactorAuth("9133146870", dbSecurity.generateOTP());
//dbSecurity.twoFactorAuth("8017922483", dbSecurity.generateOTP());