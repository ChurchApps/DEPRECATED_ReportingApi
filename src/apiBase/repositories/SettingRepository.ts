import { injectable } from "inversify"
import { DB } from "../db";
import { Setting } from "../models";
import { UniqueIdHelper } from "../helpers";

@injectable()
export class SettingRepository {

    public async save(setting: Setting) {
        if (UniqueIdHelper.isMissing(setting.id)) return this.create(setting); else return this.update(setting);
    }

    public async create(setting: Setting) {
        setting.id = UniqueIdHelper.shortId();
        return DB.query(
            "INSERT INTO settings (id, churchId, keyName, value, public) VALUES (?, ?, ?, ?, ?)",
            [setting.id, setting.churchId, setting.keyName, setting.value, setting.public]
        ).then(() => { return setting; });
    }

    public async update(setting: Setting) {
        return DB.query(
            "UPDATE settings SET churchId=?, keyName=?, value=?, public=? WHERE id=? AND churchId=?",
            [setting.churchId, setting.keyName, setting.value, setting.public, setting.id, setting.churchId]
        ).then(() => setting)
    }

    public async loadAll(churchId: string) {
        return DB.query("SELECT * FROM settings WHERE churchId=?;", [churchId]);
    }

    public async loadPublicSettings(churchId: string) {
        return DB.query("SELECT * FROM settings WHERE churchId=? AND public=?", [churchId, 1])
    }

    public convertToModel(churchId: string, data: any) {
        const result: Setting = {
            id: data.id,
            keyName: data.keyName,
            value: data.value,
            public: data.public
        };
        return result;
    }

    public convertAllToModel(churchId: string, data: any[]) {
        const result: Setting[] = [];
        data.forEach(d => result.push(this.convertToModel(churchId, d)));
        return result;
    }
}