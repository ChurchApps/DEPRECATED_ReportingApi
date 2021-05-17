import { DB } from "../db";
import { Link } from "../models";
import { UniqueIdHelper } from "../helpers";

export class LinkRepository {

    public async loadAll(churchId: string) {
        return DB.query("SELECT * FROM links WHERE churchId=? order by sort", [churchId]);
    }

    public async loadByCategory(churchId: string, category: string) {
        return DB.query("SELECT * FROM links WHERE churchId=? and category=? order by sort", [churchId, category]);
    }

    public save(link: Link) {
        if (UniqueIdHelper.isMissing(link.id)) return this.create(link); else return this.update(link);
    }

    public async create(link: Link) {
        link.id = UniqueIdHelper.shortId();
        const query = "INSERT INTO links (id, churchId, category, url, linkType, linkData, icon, text, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);";
        const params = [UniqueIdHelper.shortId(), link.churchId, link.category, link.url, link.linkType, link.linkData, link.icon, link.text, link.sort];
        return DB.query(query, params).then(() => { return link; });
    }

    public async delete(id: string, churchId: string) {
        DB.query("DELETE FROM links WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async update(link: Link) {
        return DB.query("UPDATE links SET category=?, url=?, linkType=?, linkData=?, icon=?, text=?, sort=? WHERE id=?;", [link.category, link.url, link.linkType, link.linkData, link.icon, link.text, link.sort, link.id])
            .then(() => { return link });
    }

    public async loadById(id: string, churchId: string): Promise<Link> {
        return DB.queryOne("SELECT * FROM links WHERE id=? AND churchId=?;", [id, churchId]);
    }


}
