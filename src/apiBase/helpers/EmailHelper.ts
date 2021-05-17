import AWS from 'aws-sdk'
import nodemailer from 'nodemailer'
import directTransport from 'nodemailer-direct-transport'
import { IEmailPayload } from '.'


export class EmailHelper {
    private static _mailSystem: string = process.env.MAIL_SYSTEM

    public static sendEmail(from: string, to: string, subject: string, body: string) {
        if (this._mailSystem === 'SES') {
            return this.withSes({ from, to, subject, body });
        }

        return this.withNodemailer({ from, to, subject, body });
    }

    private static withSes({ from, to, subject, body }: IEmailPayload) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                AWS.config.update({ region: 'us-east-2' });
                const ses = new AWS.SES({ apiVersion: '2010-12-01' });
                const params = {
                    Destination: {
                        ToAddresses: [to]
                    },
                    Message: {
                        Body: { Html: { Charset: "UTF-8", Data: body } },
                        Subject: { Charset: "UTF-8", Data: subject },
                    },
                    Source: from
                };
                await ses.sendEmail(params).promise();
                resolve();
            } catch (e) { reject(e); }
        });
    }

    private static withNodemailer({ from, to, subject, body }: IEmailPayload) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const transporter: nodemailer.Transporter = nodemailer.createTransport(directTransport({
                    name: 'churchapps.org'
                }));
                await transporter.sendMail({ from, to, subject, html: body });
                resolve()
            } catch (err) {
                reject(err)
            }
        })
    }

}