import { DB } from "../db";
import { Page } from "../models";
import { UniqueIdHelper } from "../helpers";

export class PageRepository {

    public save(page: Page) {
        if (UniqueIdHelper.isMissing(page.id)) return this.create(page); else return this.update(page);
    }

    public async create(page: Page) {
        page.id = UniqueIdHelper.shortId();
        const query = "INSERT INTO pages (id, churchId, name, content, path, lastModified) VALUES (?, ?, ?, ?, ?, NOW());";
        const params = [page.id, page.churchId, page.name, page.content, page.path];
        return DB.query(query, params).then(() => { return page; });
    }

    public async update(page: Page) {
        const query = "UPDATE pages SET name=?, content=?, lastModified=NOW() WHERE id=? AND churchId=?;";
        const params = [page.name, page.content, page.id, page.churchId];
        return DB.query(query, params).then(() => { return page });
    }

    public async delete(id: string, churchId: string) {
        DB.query("DELETE FROM pages WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async loadById(id: string, churchId: string): Promise<Page> {
        return DB.queryOne("SELECT * FROM pages WHERE id=? AND churchId=?;", [id, churchId]);
    }

    public async loadAll(churchId: string): Promise<Page[]> {
        return DB.query("SELECT * FROM pages WHERE churchId=?;", [churchId]);
    }


}
