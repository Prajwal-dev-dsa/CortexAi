export const getCurrentUser = async (req, res) => {
    try {
        const user = req.user
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `Error in get current user controller: ${error.message}` });
    }
}