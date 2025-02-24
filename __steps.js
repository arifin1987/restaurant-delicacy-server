/**
     * Json web token implementation:
     * npm i jsonwebtoken
     * const jwt = require('jsonwebtoken');
     * write this code in the terminal to find secret key:write: node, then write require('crypto').randomBytes(64).toString('hex')
     * Set this token to env file as ACCESS_TOKEN_SECRET =
     * // jwt related api
         app.post('/jwt', async(req,res)=>{
           const user = req.body;
           const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
             expiresIn: '1h'
           });
           res.send({token});
         })
     In the frontend AuthProvider.jsx::
     useEffect(()=>{
      const unsubsScribe = onAuthStateChanged(auth, currentUser=>{
        setUser(currentUser);
        if(currentUser){
          const userInfo = {email: currentUser.email};
          axiosPublic.post('/jwt', userInfo)
          .then(response=>{
            if(response.data.token){
              localStorage.setItem('access-token', response.data.token)
            }
            else {
              localStorage.removeItem('access-token');
            }
          })
        }
     */
    /**
     * If we want to use this in Allusers.jsx to get users related api
     * const AllUsers = () => {
    // We will use user data only here that's why we don't need to create seperate hook.
    const axiosSecure = useAxiosSecure();
    // in cookie do not need to set this
    const {data: users=[], refetch} = useQuery({
        queryKey: ['users'],
        queryFn: async ()=>{
            const result = await axiosSecure.get('/users', {
              
              headers: {
                authorization: `Bearer ${localStorage.getItem('access-token')}`
              }
            })
            return result.data;

        }
       

    })
     * 
     */
    /**
     * Now we need to verifyToken in the server side
     * // middlewares
         const verifyToken = (req,res, next)=>{
           console.log('inside verify token', req.headers);
           if(!req.headers.authorization){
             return res.status(401).send({message: 'forbidden access'});
           }
           const token = req.headers.authorization.split(' ')[1];
           jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
             if(error){
               return res.status(401).send({message: 'forbidden access'})
             }
             req.decoded = decoded;
             next();
           })
         }
     
     
         // users related api
         app.get('/users',verifyToken, async(req,res)=>{
           console.log(req.headers.authorization)
           const result = await userCollection.find().toArray();
           
           res.send(result);
         })
     */
    /**
     * // this will find whether the user is a admin or not
    app.get('/users/admin/:email', verifyToken, async(req,res)=>{
      const email = req.params.email;
      // from req.decoded we will get email because in AuthProvider.jsx while sending userInfo to jwt we set email there
      if(email !== req.decoded.email){
        return res.status(403).send({message: 'unauthorized access'})
      }
      const query = {email : email};
      const user = await userCollection.findOne(query);
      let admin = false;
      if(user){
        admin = user?.role === 'admin';
      }
      res.send({admin});
    })
      **then we will make a useAdmin.jsx hook in the client side
     */