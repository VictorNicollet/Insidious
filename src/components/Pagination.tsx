
import { h, JSX } from "preact"

export function Pagination(props: {
    page: number,
    pages: number,
    setPage: (page: number) => void
}): JSX.Element {
    const {page,pages,setPage} = props;
    return <div className="gui-pagination">
        <button class="go left" 
                disabled={page == 0} 
                onClick={() => setPage(page - 1)}/>
        <button class="go right" 
                disabled={page + 1 >= pages} 
                onClick={() => setPage(page + 1)}/>
    </div>
}

// Height of the pagination component, in pixels.
export const height = 40;